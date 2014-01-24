module Api
  module V1
    class UsersController < BaseController

      def show
        username = params.delete :username
        json_request(:get, "/1/indexes/#{User.index_name}/#{username}", params) # rate-limits check
        render json: User.find_by_username!(username), root: false
      rescue Algolia::AlgoliaProtocolError => e
        render json: JSON.parse(client.body), status: e.code
      end

    end
  end
end
