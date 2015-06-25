Album::Application.routes.draw do

 
  devise_for :users
  get "admin/folders"
  match "admin/folder/:id",
    to: "admin#folder",
    via: [:get]
  match "admin/img/:id",
    to: "admin#edit_image",
    via: [:get]
  match "admin/img/update/:id",
    to: "admin#update",
    via: [:post, :put]
  match "admin/resize",
    to: "admin#resize",
    via: [:post]
  get "admin/index"
  get "admin/update"

  ## html routes:  
  root  "album#index"
  get "album/index"
  
  match 'dir/:id',
    to: 'album#dir',
    via: [:get, :options]
  match 'about',
    to: 'album#about',
    via: [:get]
  # show slide:
  match "slide/show/:folder_id/:id",
    to: "slide#show",
    via: [:get]
  # get updated_at timestamp for a folder:
  match "img/last_updated/:id",
    to: "img#last_updated",
    via: [:get],
    constrains: {id: /\d+/}
  
  #resources :img
  # match '*', to: 'img#foo', via: [:options]


  ## json routes:
  match "img/index",
    to: "img#index",
    via: [:get, :options]
  match "img/index_folders",
    to: "img#index_folders",
    via: [:get, :options]
  match "img/reindex_folder/:name",
    to: "img#reindex_folder",
    via: [:get, :options],
    :constraints  => { :name => /.+/ }
  match 'img/dirs',
    to: "img#dirs",
    via: [:get, :options]
  match 'dir_index/:id',
    to: 'img#images_in_dir',
    via: [:get, :options]
  match 'img/exif/:id',
    to: 'img#exif',
    via: [:get, :options]
  

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
