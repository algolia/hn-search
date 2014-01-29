atom_feed do |feed|
  feed.title(@title)
  feed.updated(@updated_at)

  @stories.each do |story|
    feed.entry(story, url: "https://news.ycombinator.com/item?id=#{story.id}") do |entry|
      entry.url(story.url)
      entry.title(story.title)
      entry.content(story.text, type: 'html')
      entry.author do |author|
        author.name(story.author)
      end
    end
  end
end