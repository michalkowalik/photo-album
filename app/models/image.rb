class Image < ActiveRecord::Base
  belongs_to :folder
  has_one :exif
end
