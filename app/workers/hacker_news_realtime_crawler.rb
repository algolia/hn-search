class HackerNewsRealtimeCrawler

  def self.cron
    last_id = Item.order('id DESC').first.try(:id) || 1
    
    Item.refresh_since!(last_id)
  end

end
