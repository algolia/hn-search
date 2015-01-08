require 'net/http'

class HomeController < ApplicationController

  caches_action :popular, expires_in: 1.hour

  def index
  end

  def popular
    body = RestClient.get("https://analytics.algolia.com/1/searches/Item_production/popular?startAt=#{DateTime.now.utc.to_i - 24*60*60}&size=10", { 'X-Algolia-API-Key' => ENV['ALGOLIASEARCH_API_KEY'], 'X-Algolia-Application-Id' => ENV['ALGOLIASEARCH_APPLICATION_ID'] })
    render json: JSON.parse(body)['topSearches'], root: false
  end

  def front_page
    @stories = SimpleRSS.parse(Net::HTTP.get(URI.parse('https://news.ycombinator.com/rss'))).items.map do |item|
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
