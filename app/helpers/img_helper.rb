require 'exifr'


module ImgHelper
  class FilesHelper
    
    attr_accessor :path

    def initialize(path)
      @path = path
    end

    def dir_contents
      Dir.entries(path).
        select {|z| !File.directory? File.join(path ,z)}
    end

    def index_contents(resize = false)
      dirs = []
      (Dir.entries(path) - [".", ".."]).each do |d|
        dirs << reindex(d, resize)
      end
      dirs
    end
    
    # reindex single folder
    # by default resize images
    def reindex(folder_name, resize = true)
      d = File.join(ENV['IMG_PATH'], folder_name)
      el = {}
      el[:dirname] = d.split('/').last

      exif = ExifHelper.new(d)
        
      if Folder.where(:name => el[:dirname]).length == 0
        Folder.new(:name => el[:dirname]).save
      end
      folder = Folder.where(:name => el[:dirname]).first
        
      el[:entries] = Dir.entries(d).
        select {|z| !File.directory? File.join(d, z)}.
        sort_by{ |f| File.mtime(File.join(d, f)) }.reverse
      ## todo -- not needed here!
      el[:entries].each { |x| 
        if Image.where(:name => x, :folder => folder).length == 0
          Image.new(:name => x, :folder => folder).save 
        end
        ## Get Exif and insert it into the table:``
        ## need folder ID here as well!
        exif.save(folder, x)
        # finally, resize file if required:
        if resize
          mh = MagickHelper.new(File.join(ENV['IMG_PATH'], folder.name, x))
          mh.resize
        end
      }
      # update "modified_at" field for folder:
      folder.touch
      
      # return list of available elements:
      el
    end
  
  end  # class end
  
  class ExifHelper
    attr_accessor :path
    
    def initialize(path)
      @path = path
    end
    
    def save(folder, name)
      ## folder  id -- otherwise there are doubled images with the same name!
      image = Image.where(:name => name, :folder => folder).first
      exif_data = Exif.where(:image => image).first

      if exif_data.nil?
        begin
          exif_data = EXIFR::JPEG.new(File.join(path, name)).exif[0].to_hash
          exif_data = Hash[exif_data.map {|k, v| [k, v.to_s]}]
          img_date = exif_data[:date_time_original]

          if img_date.nil?
            img_date = File.ctime(File.join(path, name))
          else
            img_date = img_date.to_datetime
          end
          Exif.new(
            :image => image, 
            ## to_yaml needed on windows
            ## probably still good idea to leave it as it is, doesn't
            ## hurt on windows neither.
            :exif => exif_data.to_yaml, 
            :date_time => img_date).save

        rescue Exception => e
          Rails.logger.error "malformed jpg, skipping the file"
          Rails.logger.error e
          ## but save exif info with file creation date:
          Exif.new(
            :image => image,
            :date_time =>File.ctime(File.join(path, name))).save
        end
      end
    end

  end # class end

  # requires imagemahick binaries installed in path
  # (at least convert and identify)
  # probably doesn't make senese to recreate the same object all over
  # again?
  # move path as parameter to methods instead of constructor?
  class MagickHelper
    attr_accessor :path

    def initialize(path)
      @path = path
    end

    ## windows has an utility called convert
    #  to avoid problems with path settings set cygwin path.
    def magick_bin_name(name)
      if !(/mingw/ =~ RUBY_PLATFORM).nil?
        "C:/src/cygwin/bin/#{name}.exe"
      else
        name
      end
    end

    ##
    # returns an [x, y] array containing sizes in pixels
    def size
      res = %x( #{magick_bin_name("identify")} -format "%[fx:w]x%[fx:h]"  #{Shellwords.shellescape path} )
      if res.size > 0
        res.chomp.split("x").map {|x| x.to_i}
      else
        nil
      end
    end

    # check if there's thumbnail created for the file
    def has_thumbnail?
      File.exists? path.gsub(/(.+)\/(.+)/, '\1/thumbs/\2')
    end

    # if longer image side > 1042 resize to 1024 and autorotate.
    # if no thumbnail exists, create thumbnail
    def resize
      if size.max > 1024
        res = %x( #{magick_bin_name("convert")} -auto-orient -resize 1024x768 #{Shellwords.shellescape path} #{Shellwords.shellescape path})
        Rails.logger.info res
      end
      unless has_thumbnail?
        unless File.exists? path.gsub(/(.+)\/.+/, '\1/thumbs')
          Dir.mkdir path.gsub(/(.+)\/.+/, '\1/thumbs')
        end
        ## that's a bit  broken on windows - why?
        res = %x( #{magick_bin_name("convert")} -verbose -auto-orient -strip -thumbnail 300x160 #{Shellwords.shellescape path} #{Shellwords.shellescape path.gsub(/(.+)\/(.+)/, '\1/thumbs/\2')})
        Rails.logger.info res
      end
    end

  end # class end
end #module end
