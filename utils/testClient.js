import * as rp from 'request-promise';

export class TestClient{
	constructor(url){
		this.url=url;
		this.options={
			withCredentials:true,
			jar:rp.jar(),
			json:true
		};
	}

	async login(email,password){
		return rp.post(this.url,{
			...this.options,
			body:{
				query:`
					mutation{
						login(email: "${email}", password: "${password}"){
							path
							message
						}
					}
				`
			}
		});
	}

	async forgotPasswordChange(newPassword,key){
		return rp.post(this.url,{
			...this.options,
			body:{
				query:`
					mutation{
						forgotPasswordChange(newPassword: "${newPassword}", key: "${key}"){
							path
							message
						}
					}
				`
			}
		});
	}

	async register(email,password){
		return rp.post(this.url,{
			...this.options,
			body:{
				query:`
					mutation{
						register(email: "${email}", password: "${password}"){
							path
							message
						}
					}
				`
			}
		});
	}

	async me(){
		return rp.post(this.url,{
			...this.options,
			body:{
				query:`{
					me{
						id
						email
					}
				}`
			}
		});
	}

	async logout(){
		return rp.post(this.url,{
			...this.options,
			body:{
				query:`
					mutation{
						logout
					}
				`
			}
		});
	}
}