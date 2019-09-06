Rails.application.config.assets.configure do |env|
  env.context_class.send :include, ActionView::Helpers
  env.context_class.send :include, Rails.application.routes.url_helpers
end
