require 'open-uri'

class HackerNewsCrawler
  # export all available submissions to file `dest` (JSON format)
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

  # retrieve news created last hour (run every 10min on Heroku)
  def self.cron_10min
    cron(1.hour)
  end

  # retrieve news created last 48 hours (run every 1h on Heroku)
  def self.cron_1h
    cron(48.hour)
  end

  protected
  def self.cron(delta)
    last = Post.order('created_at DESC').first
    ActiveRecord::Base.transaction do
      Post.without_auto_index do
        export((last ? last.created_at : DateTime.now) - delta) do |r|
          Post.from_json!(r)
        end
      end
    end
    Post.where('id > ?', last ? last.id : 0).reindex!
  end

  HNSEARCH_HARD_LIMIT = 1000

  # work-around ThriftDB rate limit sorting on field `create_ts` and using Solr's map function (http://wiki.apache.org/solr/FunctionQuery#map)
  # original idea from `srw` (https://gist.github.com/srw/1360455)
  def self.export(from, &block)
    now = DateTime.now.utc
    while from < now
      puts "From #{from}"
      limit = 100
      start = 0
      last_create_ts = nil
      i = 0
      loop do
        url = "http://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type]=submission&start=#{start}&limit=#{limit}&sortby=map(ms(create_ts),0,#{from.to_i}000,#{now.to_i}000)%20asc"
        puts "\t#{url}"
        json = JSON.parse(open(url).read) rescue nil
        if json.nil?
          last_create_ts ||= from + 1.hour
          break
        end
        json['results'].each do |r|
          last_create_ts = DateTime.parse r['item']['create_ts']
          break if last_create_ts < from
          puts "\t\t#{r['item']['title']}"
          yield r['item']
          i += 1
        end
        break if json['results'].length < limit || start + limit >= HNSEARCH_HARD_LIMIT
        start += limit
      end
      puts "  #{i} posts"
      break if last_create_ts < from
      from = last_create_ts
    end
  end

end
