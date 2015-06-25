class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.text :name
      t.text :url
      t.references :folder, index: true

      t.timestamps
    end
  end
end
