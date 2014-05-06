class PagesController < ApplicationController
  def opensearch
    # fixes Firefox "Firefox could not download the search plugin from:"
    response.headers["Content-Type"] = 'application/opensearchdescription+xml'
    render :layout => false
  end
end
