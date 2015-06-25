class CreateFolders < ActiveRecord::Migration
  def change
    create_table :folders do |t|
      t.text :name

      t.timestamps
    end
  end
end
