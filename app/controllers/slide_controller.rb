class SlideController < ApplicationController
  layout "slide"
  ## TODO: add error handling -- for example non exising image
  def show
    @img = Image.where(:id => params['id']).as_json.first
    @folder_name = Folder.where(:id => @img["folder_id"]).first.name
    @folder_href = "http://#{ENV['APP_SERVER']}/dir/#{@img["folder_id"]}"
    @img["url"] = "http://#{ENV['IMG_SERVER']}/#{@folder_name}/#{@img["name"]}"
  end
end
