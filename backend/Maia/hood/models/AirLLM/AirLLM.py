from airllm import AutoModel


class AirLLM():
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(
        self,
        model_name: str = "zai-org/GLM-4.7-Flash",
        compression: str = "4-bit",
    ):
        if self._initialized:
            return
        self._initialized = True

        #instantiate model using model name/path.
        #optionally add compression (compression='4-bit' | '8-bit')
        self.model_name = model_name
        self.compression = compression
        self.model = AutoModel.from_pretrained(
            pretrained_model_name_or_path=model_name,
            compression=compression,
        )


    def chat(self, input_text: str):
        input_tokens = self.model.tokenizer(
            input_text,
            return_tensors="pt", 
            return_attention_mask=False, 
            truncation=True, 
            padding=False
        )

        tokenized_response = self.model.generate(
            x=input_tokens["input_ids"].cuda()
        )

        response = self.model.tokenizer.decode(tokenized_response.sequences[0])

        return response
