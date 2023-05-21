module TitleCaseFilter
    def titlecase(input)
        small_words = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'or', 'so', 'the', 'to', 'up', 'with', 'yet']

        words = input.split(' ')
        words.map!.with_index do |word, i|
            # Always capitalize the first and last word
            if i == 0 || i == words.size - 1
                word.capitalize
            # Lowercase small words
            elsif small_words.include? word.downcase
                word.downcase
            # Capitalize everything else
            else
                word.capitalize
            end
        end
        words.join(' ')
    end
end

Liquid::Template.register_filter(TitleCaseFilter)