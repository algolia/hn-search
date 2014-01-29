class HomeController < ApplicationController
  def index
  end

  def legacy
    render action: 'index'
  end

  def beta
  end

  def follow
    @story = Item.where(item_type_cd: Item.story).where(deleted: false).find(params[:story_id])
  end

  def front_page
    render text: RestClient.get("http://www.kimonolabs.com/api/rss/8g93sqj6?apikey=#{ENV['KIMONOLABS_API_KEY']}"), formats: :rss
  end

  def latest
    @stories = Item.where(item_type_cd: Item.story).where(deleted: false).order('id DESC').first(20).reverse
    @updated_at = @stories[0].created_at
    @title = "Last HN items"
    render formats: :atom
  end
end
