from airllm import AutoModel
from mlx import core


class AirLLM():
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(
        self,
        model_name: str = '01-ai/Yi-34B',
    ):
        
        print("model_name:", model_name)
        from transformers import AutoConfig
        cfg = AutoConfig.from_pretrained(model_name, trust_remote_code=True)
        print("model_type:", cfg.model_type)
        print("architectures:", cfg.architectures[0])


        if self._initialized:
            return
        self._initialized = True


        #instantiate model using model name/path.
        #optionally add compression (compression='4-bit' | '8-bit')
        self.model_name = model_name
        # self.compression = compression
        self.model = AutoModel.from_pretrained(
            pretrained_model_name_or_path=model_name,
            # compression=compression,
        )


        


    def chat(self, input_text: str):
        input_tokens = self.model.tokenizer(
            input_text,
            return_tensors="np", 
            return_attention_mask=False, 
            truncation=True, 
            padding=False
        )

        print(f'[Token IDs]\n{input_tokens["input_ids"]}')

        tokenized_response = self.model.generate(
            core.array(input_tokens['input_ids']),
            max_new_tokens=200,
            use_cache=True,
            return_dict_in_generate=True,
        )

        response = self.model.tokenizer.decode(tokenized_response.sequences[0])

        return response
