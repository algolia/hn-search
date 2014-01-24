module Api
  module V1
    class ItemsController < BaseController

      def show
        id = params.delete :id
        json_request(:get, "/1/indexes/#{Item.index_name}/#{id}", params) # rate-limits check
        render json: Item.where(deleted: false).find(id), root: false
      rescue Algolia::AlgoliaProtocolError => e
        render json: JSON.parse(client.body), status: e.code
      end

    end
  end
end
