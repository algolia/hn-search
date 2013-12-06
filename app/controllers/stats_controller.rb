class StatsController < ApplicationController
  def index
    @stories = Item.stories_per_hour_since(1.month.ago)
    @comments = Item.comments_per_hour_since(1.month.ago)
  end
end
