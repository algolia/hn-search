atom_feed do |feed|
  feed.title(@title)
  feed.updated(@updated_at)

  @stories.each do |story|
    feed.entry(story, url: "https://news.ycombinator.com/item?id=#{story.id}") do |entry|
      entry.url(story.url)
      entry.title(story.title)
      entry.content(story.text, type: 'html')
      entry.comments(story.num_comments)
      entry.points(story.points)
      entry.author(story.author)
    end
  end
end