class Post < ActiveRecord::Base

  include AlgoliaSearch

  algoliasearch per_environment: true do
    attributesToIndex ["title", "source", "url", "author"]
    customRanking ["desc(points)", "asc(best_rank)"]
  end

  def self.from_json!(e, force = false)
    return false if e['url'].blank?
    p = force ? Post.new(hn_id: e['id']) : Post.find_or_initialize_by_hn_id(e['id'])
    p.url = e['url']
    p.title = e['title']
    p.source = e['domain']
    p.points = e['points']
    p.author = e['username']
    p.comments = e['num_comments']
    p.created_at = DateTime.parse(e['create_ts'])
    p.save!
    return true
  end

end
