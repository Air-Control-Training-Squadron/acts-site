module PhoneNumberFormatter
  def phone_number(input)
    cleaned = input.to_s.gsub(/\D/, "")
    "(#{cleaned[0..2]}) #{cleaned[3..5]}-#{cleaned[6..9]}"
  end
end
  
Liquid::Template.register_filter(PhoneNumberFormatter)