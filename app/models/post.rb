require 'aws/s3'

class Post < ActiveRecord::Base
  include AlgoliaSearch

  after_save :crawl_thumbnail!

  algoliasearch per_environment: true do
    attributesToIndex ['unordered(title)', 'source', 'unordered(url)', 'author']
    customRanking ['desc(points)']
    ranking ['typo', 'proximity', 'attribute', 'custom']
    queryType 'prefixAll'
    separatorsToIndex '+#$'
  end

  def self.from_json!(e, force = false)
    return false if e['url'].blank?
    p = force ? Post.new(hn_id: e['id']) : Post.find_or_initialize_by_hn_id(e['id'])
    p.url = e['url'][0..1023]
    p.title = e['title'].try(:[], 0..254)
    p.source = e['domain'].try(:[], 0..254)
    p.points = e['points'].to_i
    p.author = e['username'].try(:[], 0..254)
    p.comments = e['num_comments'].to_i
    p.created_at = DateTime.parse(e['create_ts'])
    p.save!
    return true
  end

  def crawl_thumbnail!
    return true if AWS::S3::S3Object.exists?("#{id}.png", 'hnsearch_thumbnails')
    puts "Downloading thumbnail #{id}: #{url}"
    begin
      AWS::S3::S3Object.store("#{id}.png", open("http://api.snapito.com/web/f33c486abee039b021dd86b4338310f3b61342d6/tc?fast=yes&freshness=86400&url=#{URI.escape url}"), 'hnsearch_thumbnails', access: :public_read)
      return true
    rescue Exception => e
      puts e
      return false
    end
  end

end
