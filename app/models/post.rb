class Post < ActiveRecord::Base

  include AlgoliaSearch

  algoliasearch per_environment: true do
    attributesToIndex ["title", "source", "url", "author"]
    customRanking ["desc(points)", "asc(best_rank)"]
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

end
