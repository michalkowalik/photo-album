class CreateExifs < ActiveRecord::Migration
  def change
    create_table :exifs do |t|
      t.text :exif
      t.datetime :date_time
      t.belongs_to :image, index: true

      t.timestamps
    end
  end
end
