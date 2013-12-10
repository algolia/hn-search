Hnsearch::Application.routes.draw do

  namespace :api, defaults: { format: 'json' } do
    namespace :v1 do
      get 'items/:id', as: :items, controller: 'items', action: 'show'
      get 'users/:username', as: :users, controller: 'users', action: 'show'
      get 'search', as: :search, controller: 'search', action: 'perform'
    end
  end

  get 'feed', controller: 'home', action: 'feed'

  get 'about' => 'pages#about'
  get 'api' => 'pages#api'
  get 'cool_apps' => 'pages#cool_apps'
  get 'stats' => 'stats#index'

  root 'home#index'

end
