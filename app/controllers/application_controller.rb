class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  after_action :allow_algolia_iframe

  private
  def allow_algolia_iframe
    response.headers.delete('X-Frame-Options')
  end
end
