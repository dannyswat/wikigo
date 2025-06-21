package pages

import (
	"reflect"
	"testing"
)

func TestTokenize(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []string
	}{
		{
			name:     "English text with stopwords",
			input:    "The quick brown fox jumps over the lazy dog",
			expected: []string{"quick", "brown", "fox", "jumps", "over", "lazy", "dog"},
		},
		{
			name:     "Text with HTML tags",
			input:    "<p>Hello <strong>world</strong> this is a test</p>",
			expected: []string{"hello", "world", "this", "test"},
		},
		{
			name:     "Chinese text with 2-gram",
			input:    "你好世界测试",
			expected: []string{"你好", "好世", "世界", "界测", "测试"},
		},
		{
			name:     "Mixed English and Chinese",
			input:    "Hello 你好 world 世界 test",
			expected: []string{"hello", "你好", "world", "世界", "test"},
		},
		{
			name:     "Text with punctuation",
			input:    "Hello, world! How are you?",
			expected: []string{"hello", "world", "how", "you"},
		},
		{
			name:     "Text with numbers",
			input:    "The price is 100 dollars",
			expected: []string{"price", "100", "dollars"},
		},
		{
			name:     "Short words and stopwords filtered",
			input:    "A cat is on the mat",
			expected: []string{"cat", "mat"},
		},
		{
			name:     "HTML with Chinese content",
			input:    "<div>这是<span>测试</span>内容</div>",
			expected: []string{"这是", "测试", "内容"},
		},
		{
			name:     "Empty string",
			input:    "",
			expected: []string{},
		},
		{
			name:     "Only HTML tags",
			input:    "<div><span></span></div>",
			expected: []string{},
		},
		{
			name:     "Only stopwords",
			input:    "a an and the to",
			expected: []string{},
		},
		{
			name:     "Mixed case handling",
			input:    "HELLO World TeSt",
			expected: []string{"hello", "world", "test"},
		},
		{
			name:     "Chinese with single character (should not create 2-gram)",
			input:    "你 好",
			expected: []string{},
		},
		{
			name:     "Complex HTML with mixed content",
			input:    "<h1>Title 标题</h1><p>This is 这是 content 内容</p>",
			expected: []string{"title", "标题", "this", "这是", "content", "内容"},
		},
		{
			name:     "Numbers and special characters",
			input:    "Version 2.0 supports UTF-8 encoding",
			expected: []string{"version", "supports", "utf", "encoding"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Tokenize(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("Tokenize(%q) = %v, expected %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestTokenizeEdgeCases(t *testing.T) {
	// Test case with multiple consecutive spaces and punctuation
	input := "Hello,,,   world!!!   How    are you???"
	expected := []string{"hello", "world", "how", "you"}
	result := Tokenize(input)
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Tokenize with multiple punctuation failed: got %v, expected %v", result, expected)
	}

	// Test case with mixed scripts including unsupported ones (should be ignored)
	input = "Hello مرحبا 你好 world"
	// Arabic should be ignored, only English and Chinese should be processed
	expected = []string{"hello", "你好", "world"}
	result = Tokenize(input)
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Tokenize with mixed scripts failed: got %v, expected %v", result, expected)
	}
}

func BenchmarkTokenize(b *testing.B) {
	testCases := []struct {
		name  string
		input string
	}{
		{"English", "The quick brown fox jumps over the lazy dog"},
		{"Chinese", "你好世界这是一个测试文本"},
		{"Mixed", "Hello 你好 world 世界 this is a test 这是测试"},
		{"HTML", "<div><p>Hello <strong>world</strong> 你好<span>世界</span></p></div>"},
	}

	for _, tc := range testCases {
		b.Run(tc.name, func(b *testing.B) {
			for i := 0; i < b.N; i++ {
				Tokenize(tc.input)
			}
		})
	}
}
