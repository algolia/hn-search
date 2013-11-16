require 'open-uri'

class HackerNewsCrawler
  include Sidekiq::Worker

  def self.refresh_last
    Post.where('created_at >= ? AND hn_id IS NOT NULL', 24.hour.ago).find_each do |p|
      doc = Nokogiri::HTML(open("https://news.ycombinator.com/item?id=#{p.hn_id}")) rescue nil
      next if doc.nil?
      text = doc.css('table tr td.subtext').text
      subtext = text.scan(/(\d+) points? by (\w+) (\d+ \w+) ago .* (discuss|\d+ comments?)/).first || []
      next if subtext.length != 4
      p.points = subtext[0].to_i
      p.comments = subtext[3].to_i
      p.save!
    end
  end

  def perform
    %w{https://news.ycombinator.com/news https://news.ycombinator.com/newest}.each do |url|
      scrap(url, true).each do |post|
        p = Post.find_or_initialize_by(url: post[:href])
        puts post[:title] if p.new_record?
        p.title = post[:title]
        p.source = post[:source]
        p.best_rank = post[:rank] if p.best_rank.to_i < post[:rank]
        p.points = post[:points]
        p.author = post[:author]
        p.comments = post[:comments]
        p.hn_id = post[:hn_id]
        p.save!
      end
    end
  end

  private

  def scrap(url, deep)
    doc = Nokogiri::HTML(open(url))
    
    posts = doc.css("table table tr td.title a").map do |link|
      title = link.text
      href = link.attribute('href').text
      title_td = link.parent
      source = title_td.css('span.comhead').text.gsub(/.*\(([^)]+)\).*/, '\1')
      next if source.blank?
      tr = title_td.parent
      rank = tr.css('td.title')[0].text.to_i
      tr2 = tr.next_sibling.css("td.subtext")
      tr2_text = tr2.text
      subtext = tr2_text.scan(/(\d+) points? by (\w+) (\d+ \w+) ago .* (discuss|\d+ comments?)/).first || []
      next if subtext.length != 4
      points = subtext[0].to_i
      author = subtext[1]
      ago = subtext[2]
      comments = subtext[3].to_i
      hn_id = tr2.css('a').detect { |a| a.text["comment"] || a.text["discuss"] }.attribute('href').text.split('=').last.to_i

      {
        title: title,
        href: href,
        source: source,
        rank: rank,
        points: points,
        author: author,
        ago: ago,
        comments: comments,
        hn_id: hn_id
      }
    end.compact

    if deep
      10.times do
        doc.css('a').each do |link|
          next if link.text != "More"
          next_page = link.attribute('href').to_s
          url = "https://news.ycombinator.com#{'/' unless next_page.starts_with?('/')}#{next_page}"
          begin
            posts += scrap(url, false)
            doc = Nokogiri::HTML(open(url))
          rescue Exception => e
            puts e
            return posts
          end
        end
      end
    end

    posts
  end
end
