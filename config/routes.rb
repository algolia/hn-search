Hnsearch::Application.routes.draw do

  namespace :api, defaults: { format: 'json' } do
    namespace :v1 do
      get "items/:id", controller: 'items', action: 'show'
      get "users/:username", controller: 'users', action: 'show'
      get "search", controller: 'search', action: 'perform'
    end
  end

  root 'home#index'

end
