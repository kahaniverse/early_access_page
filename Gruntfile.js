module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      purifycss: {
        options: { minify:true },
        target: {
          src: ['site/*.html', 'vendor/**/*.js'],
          css: ['site/assets/**/*.css','site/vendor/**/*.css'],
          dest: 'site/dist/css/styles.min.css'
        },
      },
      uglify: {
        options: {
          sourceMap: true,
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        build: {
          src: 'site/**/*.js',
          dest: 'site/dist/*.min.js'
        }
      },
      embedFonts: {
        all: {
          files: {
            'site/vendor/socicon/css/styles.css': ['site/vendor/socicon/css/styles.cssx'],
            'site/vendor/web/assets/mobirise-icons2/mobirise2.css': ['site/vendor/web/assets/mobirise-icons2/mobirise2.cssx']
          }
        }
      },
      compress: {
        main: {
          options: {
            mode: 'gzip'
          },
          expand: true,
          cwd: 'site/dist/',
          src: ['**/*'],
          dest: 'site/public/'
        }
      }
    });
  
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-embed-fonts');
    grunt.loadNpmTasks('grunt-purifycss');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task(s).
    grunt.registerTask('default', ['embedFonts', 'uglify']);
  
  };