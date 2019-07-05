atom_feed do |feed|
  feed.title(@title)
  feed.updated(@updated_at)
  feed.category(term: 'technology news')

  @stories.each do |story|
    feed.entry(story, url: "https://news.ycombinator.com/item?id=#{story.id}") do |entry|
      entry.title(story.title, type: 'html')
      entry.author do |author|
        author.name(story.author)
      end

      entry.link(href: story.url)
      entry.content(story.text, type: 'html')
    end
  end
end
