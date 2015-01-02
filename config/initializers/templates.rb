Rails.application.assets.context_class.class_eval do
  include ApplicationHelper
  include ActionView::Helpers
  include AbstractController::Rendering
  include Rails.application.routes.url_helpers
end
