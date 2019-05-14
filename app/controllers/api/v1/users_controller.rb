module Api
  module V1
    class UsersController < BaseController
      def show
        render_json_request(:get, "/1/indexes/#{User.index_name}/#{params.delete :username}", params)
      end
    end
  end
end
