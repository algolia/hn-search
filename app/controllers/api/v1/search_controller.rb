module Api
  module V1
    class SearchController < BaseController

      def perform
        render_json_request(:get, "/1/indexes/#{Item.index_name}", params)
      end

      def by_date
        render_json_request(:get, "/1/indexes/#{Item.index_name}_sort_date", params)
      end

    end
  end
end
