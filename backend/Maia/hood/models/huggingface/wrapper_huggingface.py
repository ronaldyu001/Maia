from typing import Optional, Any
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


class HuggingFaceModel():
    def __init__(
        self,
        model_id: str = "backend/llms/models--mistralai--Mistral-7B-Instruct-v0.2/snapshots/63a8b081895390a26e140280378bc85ec8bce07a", # model file path
        device: str = "mps", # where llm will run. "mps" = Apple Metal GPU, "cpu" = CPU
        dtype: str = "float16", # numeric precision
        max_new_tokens: int = 2000, # max tokens llm can use to generate response
        temperature: float = 0.6, # randomness of responses
        top_p: float = 0.9, # keeps top_p percent of tokens
        repetition_penalty: float = 1.1, # discourages repeating phrase/word
        stop: Optional[list[str]] = None # stop condition
    ):
        """
        
        Arguments

        """
        # ----- default to float32 precision (slower) if not float16 -----
        torch_dtype = torch.float32

        # ----- set class variables -----
        self.model_id = model_id
        self.device = device
        self.stop = stop
        self.tokenizer = AutoTokenizer.from_pretrained( model_id, use_fast=True )
        self.model = AutoModelForCausalLM.from_pretrained( 
            model_id, 
            torch_dtype=torch_dtype, 
            device_map={"": device} if device != "cpu" else None
        ).eval()
        self.max_ctx = getattr( self.tokenizer, "model_max_length", 8192 )

        self.gen_defaults = dict(
            max_new_tokens = max_new_tokens,
            temperature = temperature,
            top_p = top_p,
            do_sample = True,
            repetition_penalty = repetition_penalty,
            pad_token_id = self.tokenizer.eos_token_id if self.tokenizer.pad_token is None else self.tokenizer.pad_token,
            eos_token_id = self.tokenizer.eos_token_id
        )


    def chat( self, prompt: list[dict], **overrides: Any ) -> str:
        # ----- use model's chat template to create prompt -----
        prompt = self.tokenizer.apply_chat_template(
            prompt,
            tokenize=False,
            add_generation_prompt=False
        )

        # ----- tokenize and generate -----
        # turns prompt into pyTorch tensor (pt) of tokens
        inputs = self.tokenizer( prompt, return_tensors="pt" )
        # 
        with torch.no_grad():
            output = self.model.generate( **inputs, **self.gen_defaults )
        reply = self.tokenizer.decode( output[0], skip_special_tokens=True )
        return reply