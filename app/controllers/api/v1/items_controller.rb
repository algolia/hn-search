module Api
  module V1
    class ItemsController < ActionController::API

      def show
        item = Item.find(params[:id])
        render json: item, root: false
      end

    end
  end
end
