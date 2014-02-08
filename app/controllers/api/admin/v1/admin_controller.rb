module Api
  module Admin
    module V1
      class AdminController < ActionController::API
        include ActionController::HttpAuthentication::Basic::ControllerMethods
        http_basic_authenticate_with :name => ENV['ADMIN_USER'], :password => ENV['ADMIN_PASSWORD']

        def item
          render json: Item.find(params[:id]), serializer: AdminItemSerializer
        end

      end
    end
  end
end
