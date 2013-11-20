require 'open-uri'

class HackerNewsCrawler
  include Sidekiq::Worker

  HNSEARCH_HARD_LIMIT = 1000

  def self.export_hnsearch_dot_com(dest)
    File.open(dest, 'w') do |f|
      f << "[\n"
      first = true
      export(DateTime.new(1970, 1, 1, 0, 0, 0)) do |r|
        f << ",\n" if !first
        first = false
        f << "\t"
        f << r['item'].to_json
      end
      f << "\n]\n"
    end
  end

  def self.cron_10min
    cron(1.hour)
  end

  def self.cron_1h
    cron(24.hour)
  end

  protected
  def self.cron(delta)
    last = Post.order('id DESC').first
    ActiveRecord::Base.transaction do
      Post.without_auto_index do
        export((last ? last.created_at : DateTime.now) - delta) do |r|
          Post.from_json!(r)
        end
      end
      Post.where('id > ?', last ? last.id : 0).reindex!
    end
  end

  def self.export(from, &block)
    now = DateTime.now
    while from < now
      puts "From #{from}"
      limit = 100
      start = 0
      last_create_ts = nil
      i = 0
      loop do
        url = "http://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type]=submission&start=#{start}&limit=#{limit}&sortby=map(ms(create_ts),0,#{from.to_i}000,#{now.to_i}000)%20asc"
        json = JSON.parse(open(url).read) rescue nil
        if json.nil?
          last_create_ts ||= from + 1.hour
          break
        end
        json['results'].each do |r|
          yield r
          last_create_ts = DateTime.parse r['item']['create_ts']
          i += 1
        end
        break if json['results'].length < limit || start + limit >= HNSEARCH_HARD_LIMIT
        start += limit
      end
      puts "  #{i} posts"
      from = last_create_ts
    end
  end

end
