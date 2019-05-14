require 'net/http'

class HomeController < ApplicationController
  caches_action :popular, expires_in: (DateTime.tomorrow.beginning_of_day.to_i - DateTime.now.to_i)

  def index
    if Rails.env.production? && !request.ssl?
      response.headers['Cache-Control'] = 'public, max-age=604800'
      params[:protocol] = 'https'
      redirect_to root_url(params), status: :moved_permanently
    end
  end

  def popular
    response = RestClient::Request.execute(
      method: :get,
      url: 'https://analytics.de.algolia.com/2/searches',
      headers: {
        'X-Algolia-API-Key': ENV['ALGOLIASEARCH_API_KEY'],
        'X-Algolia-Application-Id': ENV['ALGOLIASEARCH_APPLICATION_ID'],
        params: {
          index: 'Item_production',
          startDate: 1.day.ago.utc.strftime('%Y-%m-%d'),
          endDate: DateTime.now.utc.strftime('%Y-%m-%d'),
          limit: 10
        }
      }) rescue nil

    searches = response ? JSON.parse(response)['searches'] : []
    render json: { searches: searches }, root: false
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
