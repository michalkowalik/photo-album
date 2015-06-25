class ImageSerializer < ActiveModel::Serializer

  #self.root = false
  attributes :id, :name, :url, :folder_id, :date_time

  def url
    dir_name = Folder.where(:id => object.folder_id).first.name
    "http://#{ENV['IMG_SERVER']}/#{dir_name}/#{object.name}"
  end

end
