module Api
  module V1
    class ItemsController < BaseController

      def show
        json_request(:get, "/1/indexes/#{Item.index_name}/#{params.delete :id}", params)
      end

    end
  end
end
