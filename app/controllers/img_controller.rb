require 'exifr'
require 'pp'

class ImgController < ApplicationController
  def index
    exif_data = EXIFR::JPEG.new("#{ENV['IMG_PATH']}/fol0/IMG_0765.JPG").exif[0].to_hash
    exif_data = Hash[exif_data.map {|k, v| [k, v.to_s]}]

    render :json => exif_data
  end

  def index_folders
    fs_helper = ImgHelper::FilesHelper.new(ENV['IMG_PATH'])
    
    # index and resize.
    contents = fs_helper.index_contents(true)
    render :json => {:status => 'OK', :contents => contents}
  end

  # reindex single folder
  def reindex_folder
    folder_name = params['name']
    fs_helper = ImgHelper::FilesHelper.new(ENV['IMG_PATH'])
    contents = fs_helper.reindex(folder_name)
    render :json => {status => 'OK', :contents => contents}
  end

  def dirs
    render :json => Folder.all, :root => 'dir'
  end

  ##
  # get the "updated_at" timestamp for a folder:
  def last_updated
    f = Folder.where(:id => params['id']).first
    render json: f.nil? ? "unknown" : f.updated_at
  end

  def images_in_dir
    images = Image.joins(:exif).where(:folder => Folder.find(params['id'])).
      select("images.*, exifs.date_time").
      order("exifs.date_time DESC").all
    updated_at = Folder.find(params['id']).updated_at
    f_name = Folder.find(params['id']).name

    images.each {|z| z.url = "http://#{ENV['IMG_SERVER']}/#{f_name}/#{z.name}"}
    render json: {updated_at: updated_at, photo: images}
    
    #render :json => images, :root => 'photo'
  end

  def exif
    img = Image.where(:id => params['id']).first

    if img.nil?
      render :status => 404
    else
      exif_data = Exif.where(:Image_id => img.id).first
      if exif_data.exif.nil?
        exif_data = {"date_time" => exif_data.date_time}
      else
        exif_data = YAML::load(exif_data.exif)
        if img.description?
          exif_data[:description] = img.description
        end
      end

      render json: {
        status: 'OK',
        contents: exif_data
      }
    end
  end

end
