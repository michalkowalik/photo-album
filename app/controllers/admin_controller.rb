class AdminController < ApplicationController
  before_filter :authenticate_user!

  def folders
    folders_on_fs = Dir.entries(ENV['IMG_PATH']) - [".", ".."]
    @folders = folders_on_fs.map {|z|
      folder_id = Folder.where(:name => z).first.nil? ? '' : Folder.where(:name => z).first.id
      {
        :id => folder_id,
        :name => z,
        :count => Image.where(:folder_id => folder_id).count,
        :fs_count => ImgHelper::FilesHelper.new(
          File.join(ENV['IMG_PATH'], z)).dir_contents.count
      }}
  end

  def folder
    @folder_name = Folder.find(params['id']).name
    @files_indexed = Image.where(:folder_id => params['id']).map {|z| z.name}.sort
    @files_fs = ImgHelper::FilesHelper.new(
      File.join(ENV['IMG_PATH'], @folder_name)).dir_contents.sort.map {|z|
        { 
          :id => Image.where(:name =>z, :folder_id => params['id']).first.nil? ? '' : Image.where(:name =>z, :folder_id => params['id']).first.id,
          :name => z,
          :size => ImgHelper::MagickHelper.new(File.join(ENV['IMG_PATH'], @folder_name, z))
            .size.join(" x "),
          :thumb => ImgHelper::MagickHelper.new(File.join(ENV['IMG_PATH'], @folder_name, z))
            .has_thumbnail? ? "Y" : "N",
          :indexed => (@files_indexed.include? z) ? 'Y' : 'N'
        }}

    # find files removed on filesystem, but still in DB:
    diff =  @files_indexed.select {|a| !@files_fs.any? {|h| h[:name] == a}}
    diff.each do |el|
      @files_fs << {:id => '', :name => el, :indexed => 'Not on FS!'}
    end
    @files_fs
  end

  # per folder:
  # - remove from db images removed on file system
  # - add non-indexed images.    
  # - Should react to GET, POST not required here (?)
  def index(folder, image_name)
    if Image.where(:name => image_name, :folder => folder).length == 0
      Image.new(:name => image_name, :folder => folder).save 
    end
    # save exit:
    ImgHelper::ExifHelper.new(File.join(ENV['IMG_PATH'], folder.name)).
      save(folder, image_name)
  end

  ##
  # delete: remove from database
  # delete from file system.
  def delete(folder, image_name)
    begin
      Rails.logger.info "deleting #{image_name}"
      res = File.delete(File.join(ENV["IMG_PATH"], folder.name, image_name))
      if res == 1
        ## remove thumb
        File.delete(File.join(ENV["IMG_PATH"], folder.name, "thumbs", image_name))
        ## remove from db
        img = Image.where(:name => image_name, :folder =>folder).first
        Exif.where(:image => img).destroy_all
        img.destroy
      else
        Rails.logger.error "huh, something went wrong"
      end
    rescue Exception => e
      Rails.logger.error "Can't delete file"
      Rails.logger.error e
    end
  end

  # update object definition:
  # - add readable name
  # - change date in corresponding exif object
  # - should react to POST!
  def update
    i = Image.find(params[:id])
    i.description = params["descr"].strip
    i.save

    # update associated exif info:
    unless params["date-time"].length == 0
      e = Exif.where(:image_id => i.id).first
      e.date_time = params["date-time"]
      e.save
    end

    # set as cover image:
    unless params["cover-image"] == nil
      f = Folder.find(i.folder_id)
      f.cover = i.id
      f.save
    end
    
    redirect_to "/admin/folder/#{i.folder.id}"
  end

  ## update existing image - with view
  def edit_image
    @image = Image.find(params["id"])
    @folder_name = @image.folder.name
  end
  
  
  # resize image
  def resize
    Rails.logger.info params
    folder = Folder.where(:name => params["folder_name"]).first
    case params["img_action"]
    when "resize"
      ImgHelper::MagickHelper.new(File.join(ENV['IMG_PATH'], params["folder_name"], params["img_name"])).resize
    when "index"
      index(folder, params["img_name"])
    when "delete"
      delete(folder, params["img_name"])
    else
      Rails.logger.info "no action defined yet"
    end
    redirect_to action: "folder", id: folder.id
  end
end
