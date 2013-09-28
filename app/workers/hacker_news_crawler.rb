require 'open-uri'

class HackerNewsCrawler
  include Sidekiq::Worker

  def perform
    %w{https://news.ycombinator.com/news https://news.ycombinator.com/newest}.each do |url|
      scrap(url, true).each do |post|
        p = Post.find_or_initialize_by(url: post[:href])
        p.title = post[:title]
        p.source = post[:source]
        p.best_rank = post[:rank] if p.best_rank.to_i < post[:rank]
        p.points = post[:points]
        p.author = post[:author]
        p.ago = post[:ago]
        p.comments = post[:comments]
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
      tr2_text = tr.next_sibling.css("td.subtext").text
      subtext = tr2_text.scan(/(\d+) points? by (\w+) (\d+ \w+) ago .* (\d+) comments?/).first || []
      next if subtext.length != 4
      points = subtext[0].to_i
      author = subtext[1]
      ago = subtext[2]
      comments = subtext[3].to_i

      {
        title: title,
        href: href,
        source: source,
        rank: rank,
        points: points,
        author: author,
        ago: ago,
        comments: comments
      }
    end.compact

    if deep
      10.times do
        doc.css('a[rel="nofollow"]').each do |link|
          next if link.text != "More"
          next_page = link.attribute('href')
          url = "https://news.ycombinator.com#{next_page}"
          posts += scrap(url, false)
          doc = Nokogiri::HTML(open(url))
        end
      end
    end

    posts
  end
end
