#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'optparse'

class JSONComparer
  UNDEFINED_VALUE = 'undefined_value'

  def initialize(file1_path, file2_path)
    @file1_path = file1_path
    @file2_path = file2_path
  end

  def compare
    json1 = load_json(@file1_path)
    json2 = load_json(@file2_path)
    
    differences = find_differences(json1, json2)
    
    if differences.empty?
      puts "файлы одинаковые"
    else
      output_file = generate_output_filename
      write_differences(differences, output_file)
      puts "файлы различаются, результат сохранен в #{output_file}"
    end
  rescue => e
    puts "Ошибка: #{e.message}"
    exit 1
  end

  private

  def load_json(file_path)
    unless File.exist?(file_path)
      raise "Файл не найден: #{file_path}"
    end

    content = File.read(file_path)
    JSON.parse(content)
  rescue JSON::ParserError => e
    raise "Невалидный JSON в файле #{file_path}: #{e.message}"
  end

  def find_differences(obj1, obj2, path = [])
    differences = {}
    all_keys = get_all_keys(obj1, obj2)

    all_keys.each do |key|
      current_path = path + [key]
      value1 = get_value_or_undefined(obj1, key)
      value2 = get_value_or_undefined(obj2, key)

      if both_present_and_different_types?(value1, value2)
        differences[current_path.join('.')] = [value1, value2]
      elsif both_hashes?(value1, value2)
        nested_diff = find_differences(value1, value2, current_path)
        differences.merge!(nested_diff)
      elsif both_arrays?(value1, value2)
        array_diff = compare_arrays(value1, value2, current_path)
        differences.merge!(array_diff) unless array_diff.empty?
      elsif value1 != value2
        differences[current_path.join('.')] = [value1, value2]
      end
    end

    differences
  end

  def get_all_keys(obj1, obj2)
    keys1 = obj1.is_a?(Hash) ? obj1.keys : []
    keys2 = obj2.is_a?(Hash) ? obj2.keys : []
    (keys1 + keys2).uniq
  end

  def get_value_or_undefined(obj, key)
    if obj.is_a?(Hash) && obj.key?(key)
      obj[key]
    else
      UNDEFINED_VALUE
    end
  end

  def both_present_and_different_types?(value1, value2)
    value1 != UNDEFINED_VALUE && 
    value2 != UNDEFINED_VALUE && 
    value1.class != value2.class
  end

  def both_hashes?(value1, value2)
    value1.is_a?(Hash) && value2.is_a?(Hash)
  end

  def both_arrays?(value1, value2)
    value1.is_a?(Array) && value2.is_a?(Array)
  end

  def compare_arrays(arr1, arr2, path)
    differences = {}
    max_length = [arr1.length, arr2.length].max

    (0...max_length).each do |index|
      current_path = path + [index]
      value1 = index < arr1.length ? arr1[index] : UNDEFINED_VALUE
      value2 = index < arr2.length ? arr2[index] : UNDEFINED_VALUE

      if both_hashes?(value1, value2)
        nested_diff = find_differences(value1, value2, current_path)
        differences.merge!(nested_diff)
      elsif value1 != value2
        differences[current_path.join('.')] = [value1, value2]
      end
    end

    differences
  end

  def generate_output_filename
    timestamp = Time.now.strftime('%Y%m%d_%H%M%S')
    "results_#{timestamp}.json"
  end

  def write_differences(differences, output_file)
    File.write(output_file, JSON.pretty_generate(differences))
  end
end

# Парсинг аргументов командной строки
def parse_arguments
  options = {}
  
  OptionParser.new do |opts|
    opts.banner = "Использование: #{$0} файл1.json файл2.json"
    opts.on("-h", "--help", "Показать справку") do
      puts opts
      exit
    end
  end.parse!

  if ARGV.length != 2
    puts "Ошибка: необходимо указать два файла для сравнения"
    puts "Использование: #{$0} файл1.json файл2.json"
    exit 1
  end

  [ARGV[0], ARGV[1]]
end

# Основная логика
if __FILE__ == $0
  file1_path, file2_path = parse_arguments
  comparer = JSONComparer.new(file1_path, file2_path)
  comparer.compare
end
