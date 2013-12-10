class HomeController < ApplicationController
  def index
  end

  def feed
    @stories = Item.where(item_type_cd: Item.story).where(deleted: false).order('id DESC').first(20).reverse
  end
end
