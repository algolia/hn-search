require 'net/http'

class HomeController < ApplicationController
  caches_action :popular, expires_in: 1.hour

  def index
    if Rails.env.production? && !request.ssl?
      response.headers['Cache-Control'] = 'public, max-age=604800'
      params[:protocol] = 'https'
      redirect_to root_url(params), status: :moved_permanently
    end
  end

  def popular
    body = RestClient::Request.execute(
      method: :get,
      url: "https://analytics.algolia.com/1/searches/Item_production/popular?startAt=#{DateTime.now.utc.to_i - 24*60*60}&size=10",
      headers: {
        'X-Algolia-API-Key' => ENV['ALGOLIASEARCH_API_KEY'],
        'X-Algolia-Application-Id' => ENV['ALGOLIASEARCH_APPLICATION_ID']
      },
      timeout: 0.1,
      open_timeout: 0.05) rescue nil

    searches = body ? JSON.parse(body)['topSearches'] : []
    render json: searches, root: false
  end

  def front_page
    @stories = Item.where(front_page: true).all
    @updated_at = DateTime.now
    @title = "HN's home page"
    feed
  end

  def latest
    @stories = Item.where(item_type_cd: Item.story, deleted: false).order('id DESC').first(20).reverse
    @updated_at = @stories[0].created_at
    @title = 'Last HN items'
    feed
  end

  def userfeed
    @stories = Item.where(item_type_cd: Item.comment).where(author: params[:username]).order('id DESC').first(20).reverse
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
