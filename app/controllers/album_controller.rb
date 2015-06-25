class AlbumController < ApplicationController

  def index
    @dirs = Folder.all.order(:name)
    @dirs = @dirs.map {|z| {:name => z.name, 
                            :id => z.id, 
                            :first_image => first_image(z.id, z.name)}}
    # this should call default rendered, shouldn't it?
  end


  ##
  # Either cover image, or first in folder
  def first_image(folder_id, folder_name)
    if Folder.find(folder_id).cover == nil
      i = Image.joins(:exif).where(:folder_id => folder_id).
        order("exifs.date_time DESC").first.name
    else
      i = Image.find(Folder.find(folder_id).cover).name
    end
    "http://#{ENV['IMG_SERVER']}/#{folder_name}/#{i}"
  end

  def dir
    @folder = Folder.find(params['id'])
  end

  def about
    #nothing to see here yet.
  end

end
