module Api
  module V1
    class UsersController < ActionController::API

      def show
        user = User.find_by_username!(params[:username])
        render json: user, root: false
      end

    end
  end
end
