class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  after_action :allow_algolia_iframe

  # called by last route matching unmatched routes.
  # Raises RoutingError which will be rescued from in 
  # the same way as other exceptions.
  def raise_not_found!
    raise ActionController::RoutingError.new("No route matches #{params[:unmatched_route]}")
  end

  private

  def allow_algolia_iframe
    response.headers.delete('X-Frame-Options')
  end
end
