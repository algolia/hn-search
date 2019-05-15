module Api
  module V1
    class ItemsController < BaseController
      def show
        render_json_request(:get, "/1/indexes/#{Item.index_name}/#{params.delete :id}", params) do |id|
          Item.where(deleted: false).find(id)
        end
      end
    end
  end
end
