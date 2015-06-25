class FolderSerializer < ActiveModel::Serializer

  #self.root = false
  attributes :id, :name, :first_image, :updated_at

  def dir_id
    object.id
  end

  def first_image
    i = Image.where(:folder_id => object.id).first.name
    "http://#{ENV['IMG_SERVER']}/#{object.name}/#{i}"
  end

end
