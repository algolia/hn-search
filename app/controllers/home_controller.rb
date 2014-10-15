class HomeController < ApplicationController
  def index
  end

  def legacy
    render action: 'index'
  end

  def follow
    @story = Item.where(item_type_cd: Item.story).where(deleted: false).find(params[:story_id])
  end

  def front_page
    @stories = SimpleRSS.parse(RestClient.get("https://news.ycombinator.com/rss")).items.map do |item|
      Item.find(item[:comments].split('=').last) rescue nil
    end.compact
    @updated_at = DateTime.now
    @title = "HN's home page"
    feed
  end

  def latest
    @stories = Item.where(item_type_cd: Item.story).where(deleted: false).order('id DESC').first(20).reverse
    @updated_at = @stories[0].created_at
    @title = "Last HN items"
    feed
  end

  def userfeed
    @stories = Item.where(item_type_cd: Item.comment).where(deleted: false).where(author: params[:username]).order('id DESC').first(20).reverse
    @updated_at = DateTime.now
    @title = params[:username]+"'s comments"
    feed
  end

  private
  def feed
    respond_to do |format|
      format.json { render json: @stories, root: false, content_type: 'application/json' }
      format.all { render action: 'feed', formats: :atom, content_type: 'application/atom+xml' }
    end
  end
end
